import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { NoResultError } from 'kysely';
import z from 'zod';
import { DatabaseError } from 'pg';
import nodemailer from 'nodemailer';
import config from '../../config';

import db from '../../db';
import {
  AccountSchema,
  accountSchema,
  donationCenterSchema,
  userSchema,
} from '../../schemas';
import { getAuthValidator } from '../middlewares';
import { generateJWT, saltRounds, getDuplicateProperty } from '../utils';
import { createValidator } from '../middlewares/requestValidator';

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

// Define the transporter to send email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: config.EMAIL_USER, // Your Gmail email address from environment variable
    pass: config.EMAIL_PASS, // Your Gmail password or app password from env
  },
});

router.post(
  '/signup',
  createValidator({
    query: signupQuerySchema,
    body: signupBodySchema,
  }),
  async (req: SignupRequest, res: Response, next) => {
    try {
      // Insert the new account and profile into the database
      const inserted = await db.transaction().execute(async (trx) => {
        const { password, ...insertedAccount } = (await trx.insertInto('account')
          .values({
            ...req.body.account,
            password: await bcrypt.hash(req.body.account.password, saltRounds),
          }).returningAll().executeTakeFirstOrThrow());

        // Insert profile into pending_donation_centers OR user table
        const insertedProfile = await trx.insertInto(req.query.role === 'donation_center' ? 'pending_donation_center' : req.query.role).values({
          ...req.body.profile,
          id: insertedAccount.id,
        }).returningAll().executeTakeFirstOrThrow();

        return {
          account: insertedAccount,
          profile: insertedProfile,
        };
      });

      // Send email to admin if role is 'donation_center'
      if (req.query.role === 'donation_center') {
        const { email } = req.body.account;
        const requestBodyString = JSON.stringify(req.body, null, 2);

        const approveUrl = `http://${config.SERVER_HOST}:${config.SERVER_PORT}/auth/approve/${inserted.account.id}`;
        const rejectUrl = `http://${config.SERVER_HOST}:${config.SERVER_PORT}/auth/reject/${inserted.account.id}`;
        const message = `A new donation center with email ${email} has signed up.\n
                        Click here to approve: ${approveUrl}\n
                        Click here to reject: ${rejectUrl}\n\n
                        Request Body:\n${requestBodyString}`;

        const mailOptions = {
          from: 'hacktivists.org@gmail.com', // Your Gmail email address
          to: 'jay.hacktivists.org@gmail.com', // Admin email address
          subject: 'New Donation Center Sign-up',
          text: message,
        };

        await transporter.sendMail(mailOptions);
        res.json({ status: 'Waiting for approval from admin' });
        return;
      }

      // Send response with token if role is 'user'
      res.json({
        ...inserted,
        token: generateJWT(inserted.account.id, 'user'),
      });
    } catch (error) {
      // Handle errors
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

router.get('/approve/:accountId', async (req, res, next) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);

    await db.transaction().execute(async (trx) => {
      // Retrieve pending_donation_centers data and remove the entry
      const pendingDonationCenter = await trx.deleteFrom('pending_donation_center')
        .where('id', '=', accountId)
        .returningAll()
        .executeTakeFirstOrThrow();

      // Insert the pending_donation_centers data into the donation_center table
      await trx.insertInto('donation_center').values(pendingDonationCenter).executeTakeFirstOrThrow();
    });

    res.json({ status: `Donation Center (id: ${accountId}) approved successfully!` });
  } catch (error) {
    next(error);
  }
});

const loginValidator = createValidator({
  body: accountSchema.pick({ email: true, password: true }),
});

router.get('/reject/:accountId', async (req, res, next) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);

    // Delete the account from the pending_donation_center table
    await db.deleteFrom('pending_donation_center')
      .where('id', '=', accountId)
      .execute();

    res.json({ status: `Donation Center (id: ${accountId}) rejected successfully!` });
  } catch (error) {
    next(error);
  }
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

export default router;
