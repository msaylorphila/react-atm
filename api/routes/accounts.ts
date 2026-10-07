import express, { Request, Response } from "express";
import Joi, { Schema } from "joi";
import { getAccount } from "../handlers/accountHandler";
import { getDailyWithdrawalTotal } from "../handlers/transactionHandler";

const router = express.Router();

const getAccountSchema: Schema = Joi.string()
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    "string.pattern.base": "Account ID must be a number",
    "string.empty": "Account ID is required",
  });

router.get("/:accountID", async (request: Request, response: Response) => {
  const {error} = getAccountSchema.validate(request.params.accountID);
  
  if (error) return response.status(400).send(error.details[0].message);

  try {
    const account = await getAccount(request.params.accountID);
    const dailyWithdrawn = await getDailyWithdrawalTotal(request.params.accountID);
    response.status(200).send({ 
      ...account, 
      dailyWithdrawn
    });
  } catch (err) {
    response.status(404).send({"error": "Account not found"});
  }
});

export default router;