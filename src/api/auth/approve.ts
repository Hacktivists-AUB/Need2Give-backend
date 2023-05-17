import { Router } from 'express';
import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';

import db from '../../db';
import transporter from './transporter';
import config from '../../config';
import confirmationValidator from './confirmationValidator';
import { movePendingUser, movePendingDonationCenter } from './utils';

const router = Router();

router.get('/user/:id', confirmationValidator, async (req, res, next) => {
  try {
    const inserted = await movePendingUser(Number(req.params.id), Number(req.query.key));

    await transporter.sendMail({
      from: config.EMAIL_USER,
      to: inserted.email,
      subject: 'Need2Give - Sign up approved',
      html: [
        `Dear ${inserted.full_name},`,
        'Your account has been successfully activated, you can now log in to Need2Give.',
        'Best regards,<br>Hacktivists Team<br>',
      ].join('<br><br>'),
    });

    res.json({ status: 'Account approved successfully!' });
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

router.get('/donation_center/:id', confirmationValidator, async (req, res, next) => {
  try {
    const pendingProfile = await db.selectFrom('pending_account')
      .innerJoin('pending_donation_center', 'pending_account.id', 'pending_donation_center.id')
      .selectAll()
      .where('pending_account.id', '=', Number(req.params.id))
      .where('validation_key', '=', Number(req.query.key))
      .executeTakeFirstOrThrow();

    if (pendingProfile.admin_validated) {
      await movePendingDonationCenter(pendingProfile.id);
      await transporter.sendMail({
        from: config.EMAIL_USER,
        to: pendingProfile.email,
        subject: 'Need2Give - Sign up approved',
        html: [
          `Dear ${pendingProfile.name},`,
          'Your account has been successfully activated, you can now log in to Need2Give.',
          'Best regards,<br>Hacktivists Team<br>',
        ].join('<br><br>'),
      });
    } else {
      await db.updateTable('pending_donation_center')
        .where('id', '=', Number(req.params.id))
        .set({ email_validated: true })
        .executeTakeFirstOrThrow();
      await transporter.sendMail({
        from: config.EMAIL_USER,
        to: pendingProfile.email,
        subject: 'Need2Give - Waiting for system admins',
        html: [
          `Dear ${pendingProfile.name},`,
          'For safety purposes, your account needs to be reviewed by the system admins before being activated. You will be notified when able to log in.',
          'Best regards,<br>Hacktivists Team<br>',
        ].join('<br><br>'),
      });
    }

    res.json({ status: 'Account approved successfully!' });
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

router.get('/admin/:id', confirmationValidator, async (req, res, next) => {
  try {
    const pendingProfile = await db.selectFrom('pending_donation_center')
      .innerJoin('pending_account', 'pending_account.id', 'pending_donation_center.id')
      .selectAll()
      .where('pending_donation_center.id', '=', Number(req.params.id))
      .where('admin_key', '=', Number(req.query.key))
      .executeTakeFirstOrThrow();

    if (pendingProfile.email_validated) {
      await movePendingDonationCenter(pendingProfile.id);
      await transporter.sendMail({
        from: config.EMAIL_USER,
        to: pendingProfile.email,
        subject: 'Need2Give - Account activated',
        html: [
          `Dear ${pendingProfile.name},`,
          'Your account has been reviewed by the system admins. You can now log in to Need2Give.',
          'Best regards,<br>Hacktivists Team<br>',
        ].join('<br><br>'),
      });
    } else {
      await db.updateTable('pending_donation_center')
        .where('id', '=', Number(req.params.id))
        .set({ admin_validated: true })
        .executeTakeFirstOrThrow();
    }

    res.json({ status: 'Account approved successfully!' });
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
