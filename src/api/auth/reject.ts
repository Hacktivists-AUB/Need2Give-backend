import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';

import { Router } from 'express';
import confirmationValidator from './confirmationValidator';
import db from '../../db';
import { deletePendingDonationCenter, deletePendingUser } from './utils';
import transporter from './transporter';
import config from '../../config';

const router = Router();

router.get('/user/:id', confirmationValidator, async (req, res, next) => {
  try {
    await db.transaction().execute(
      (trx) => deletePendingUser(trx, Number(req.params.id), Number(req.query.key)),
    );
    res.json({ status: 'Account rejected successfully!' });
  } catch (error) {
    if (error instanceof NoResultError) {
      res.status(404);
    }
    next(error);
  }
});

router.get('/donation_center/:id', confirmationValidator, async (req, res, next) => {
  try {
    await db.selectFrom('pending_account')
      .selectAll()
      .where('pending_account.id', '=', Number(req.params.id))
      .where('validation_key', '=', Number(req.query.key))
      .executeTakeFirstOrThrow();
    await db.transaction().execute(
      (trx) => deletePendingDonationCenter(trx, Number(req.params.id)),
    );
    res.json({ status: 'Account rejected successfully!' });
  } catch (error) {
    if (error instanceof NoResultError) {
      res.status(404);
    }
    next(error);
  }
});

router.get('/admin/:id', confirmationValidator, async (req, res, next) => {
  try {
    const pendingProfile = await db.transaction().execute(async (trx) => {
      await db.selectFrom('pending_donation_center')
        .selectAll()
        .where('pending_donation_center.id', '=', Number(req.params.id))
        .where('admin_key', '=', Number(req.query.key))
        .executeTakeFirstOrThrow();
      return deletePendingDonationCenter(trx, Number(req.params.id));
    });
    await transporter.sendMail({
      from: config.EMAIL_USER,
      to: pendingProfile.account.email,
      subject: 'Need2Give - Account rejected',
      html: [
        `Dear ${pendingProfile.donationCenter.name},`,
        'Your account has unfortunately been rejected by the system admins.',
        'Best regards,<br>Hacktivists Team<br>',
      ].join('<br><br>'),
    });

    res.json({ status: 'Account rejected successfully!' });
  } catch (error) {
    if (error instanceof NoResultError) {
      res.status(404);
    }
    if (error instanceof DatabaseError) {
      res.status(400);
    }
    next(error);
  }
});

export default router;
