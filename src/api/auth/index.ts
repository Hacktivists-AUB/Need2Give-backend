import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { NoResultError } from 'kysely';
import z from 'zod';
import { DatabaseError } from 'pg';

import config from '../../config';
import db from '../../db';
import {
  AccountSchema,
  PendingDonationCenterSchema,
  accountSchema,
  donationCenterSchema,
  userSchema,
} from '../../schemas';
import { getAuthValidator } from '../middlewares';
import {
  generateJWT,
  saltRounds,
  getDuplicateProperty,
  toHtmlTable,
} from '../utils';
import { createValidator } from '../middlewares/requestValidator';
import transporter from './transporter';
import approve from './approve';
import reject from './reject';
import { PendingAccountSchema } from '../../schemas/account';

const router = Router();

const signupBodySchema = z.object({
  account: accountSchema.omit({ id: true, created_at: true }),
  profile: donationCenterSchema.omit({ id: true }).or(userSchema.omit({ id: true })),
});
const signupQuerySchema = z.object({
  role: z.enum(['donation_center', 'user']),
}).strict();
type SignupRequest =
  Request<{}, {}, z.infer<typeof signupBodySchema>, z.infer<typeof signupQuerySchema>>;

function getValidationUrl(id: number, key: number, action: 'approve' | 'reject', role: 'user' | 'donation_center' | 'admin') {
  const root = (config.NODE_ENV === 'development')
    ? `${config.SERVER_HOST}:${config.SERVER_PORT}`
    : config.SERVER_HOST;
  return `${root}/auth/${action}/${role}/${id}?key=${key} `;
}

async function sendAccountValidationEmail(account: Omit<PendingAccountSchema, 'password'>, role: 'user' | 'donation_center') {
  await transporter.sendMail({
    from: config.EMAIL_USER,
    to: account.email,
    subject: 'Need2Give - Account Activation',
    html: [
      `Dear ${account.username},`,
      '<br>Thank you for signing up to our app! Before we can activate your account, we need to verify your email address.',
      '<br>To complete the account activation process, please click on the following link:',
      getValidationUrl(account.id, account.validation_key, 'approve', role),
      '<br>If you did not sign up for our app or believe this email has been sent to you by mistake, please click on the folowing link:',
      getValidationUrl(account.id, account.validation_key, 'reject', role),
      '<br>Best regards,',
      '<br>Hacktivists Team<br>',
    ].join('<br>'),
  });
}

async function sendAdminValidationEmail(account: Omit<PendingAccountSchema, 'password'>, donationCenter: PendingDonationCenterSchema) {
  const {
    admin_validated: adminValidated,
    email_validated: emailValidated,
    admin_key: adminKey,
    validation_key: validationKey,
    id,
    ...tableContent
  } = { ...account, ...donationCenter };

  await transporter.sendMail({
    from: config.EMAIL_USER,
    to: config.EMAIL_ADMIN,
    subject: `Need2Give - ${donationCenter.name} Account Validation`,
    html: [
      'Dear system admin,',
      '<br>A new donation center has requested to sign up.',
      '<br>Click here to approve:',
      getValidationUrl(account.id, donationCenter.admin_key, 'approve', 'admin'),
      '<br>Click here to reject:',
      getValidationUrl(account.id, donationCenter.admin_key, 'reject', 'admin'),
      `<br>Donation center:\n${toHtmlTable(tableContent)}`,
      '<br>Best regards,',
      'Hacktivists Team<br>',
    ].join('<br>'),
  });
}

router.post(
  '/signup',
  createValidator({
    query: signupQuerySchema,
    body: signupBodySchema,
  }),
  async (req: SignupRequest, res: Response, next) => {
    try {
      await db.transaction().execute(async (trx) => {
        const { password, ...insertedAccount } = await trx
          .insertInto('pending_account').values({
            ...req.body.account,
            password: await bcrypt.hash(req.body.account.password, saltRounds),
          }).returningAll().executeTakeFirstOrThrow();

        const insertedProfile = await trx
          .insertInto(`pending_${req.query.role}`)
          .values({
            ...req.body.profile,
            id: insertedAccount.id,
          }).returningAll().executeTakeFirstOrThrow();

        await sendAccountValidationEmail(
          insertedAccount,
          req.query.role,
        );
        if (req.query.role === 'donation_center') {
          await sendAdminValidationEmail(
            insertedAccount,
            insertedProfile as PendingDonationCenterSchema,
          );
        }
        res.json({ status: 'Check your email' });
      });
    } catch (error) {
      if (error instanceof DatabaseError) {
        const duplicateProperty = getDuplicateProperty(error);
        if (duplicateProperty !== null) {
          res.status(duplicateProperty === 'email' ? 400 : 409);
          next(new Error(`Duplicate ${duplicateProperty}`));
          return;
        }
      }
      next(error);
    }
  },
);

const loginValidator = createValidator({
  body: accountSchema.pick({ email: true, password: true }),
});

router.post('/login', loginValidator, async (req: Request<{}, {}, Pick<AccountSchema, 'email' | 'password'>>, res: Response, next) => {
  try {
    const { password, ...account } = await db.selectFrom('account').selectAll()
      .where('email', '=', req.body.email).executeTakeFirstOrThrow();

    if (!await bcrypt.compare(req.body.password, password)) {
      throw new EvalError();
    }

    const role = (await db.selectFrom('user')
      .where('user.id', '=', account.id)
      .executeTakeFirst()) === undefined ? 'donation_center' : 'user';

    res.json({
      account,
      token: generateJWT(account.id, role),
    });
  } catch (error) {
    if (error instanceof NoResultError || error instanceof EvalError) {
      res.status(400);
      next(new Error('Invalid credentials'));
    } else {
      next(error);
    }
  }
});

router.get('/test', getAuthValidator('account'), async (_req, res) => {
  res.json({
    profile: res.locals.profile,
    status: 'Authorized',
  });
});

router.patch('/', createValidator({
  body: accountSchema.pick({ email: true, password: true, phone_number: true }),
}), async (req, res, next) => {
  try {
    const { password, ...account } = await db.selectFrom('account')
      .selectAll()
      .where('email', '=', req.body.email)
      .executeTakeFirstOrThrow();

    if (!await bcrypt.compare(req.body.password, password)) {
      throw new EvalError();
    }

    const { password: filtered, ...updatedAccount } = await db.updateTable('account')
      .set({ phone_number: req.body.phone_number })
      .where('id', '=', account.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    res.json({
      account: updatedAccount,
    });
  } catch (error) {
    if (error instanceof NoResultError || error instanceof EvalError) {
      res.status(400);
      next(new Error('Invalid credentials'));
    } else {
      next(error);
    }
  }
});

router.delete(
  '/',
  loginValidator,
  async (req: Request<{}, {}, Pick<AccountSchema, 'email' | 'password'>>, res: Response, next) => {
    try {
      const { password, ...account } = await db.deleteFrom('account')
        .where('email', '=', req.body.email)
        .returningAll().executeTakeFirstOrThrow();
      res.json({ account });
    } catch (error) {
      if (error instanceof NoResultError) {
        res.status(404);
      }
      next(error);
    }
  },
);

router.use('/approve', approve);
router.use('/reject', reject);

export default router;
