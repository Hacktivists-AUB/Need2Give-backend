import { z } from 'zod';

import { createValidator } from '../middlewares';
import { idSchema } from '../../schemas';
import { pendingAccountSchema } from '../../schemas/account';

const confirmationValidator = createValidator({
  params: z.object({ id: idSchema }),
  query: z.object({ key: pendingAccountSchema.shape.validation_key }),
});

export default confirmationValidator;
