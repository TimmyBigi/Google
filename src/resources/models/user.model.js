import Joi from "joi";

const userSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^\d{10,15}$/).required(), 
    plan: Joi.string().required(),
    premium_amount: Joi.number().min(0).required(), 
    start_policy_date: Joi.date().iso().required(), 
    end_policy_date: Joi.date().iso().greater(Joi.ref("start_policy_date")).required(),
  });

  export default userSchema;
