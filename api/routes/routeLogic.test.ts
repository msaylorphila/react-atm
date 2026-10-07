import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import * as accountHandler from "../handlers/accountHandler";
import * as transactionHandler from "../handlers/transactionHandler";

const createServer = (route: express.Router) => {
  const app = express();
  app.use(express.json());
  app.use(route);
  return app;
};

test("accounts route rejects non-numeric account ids", async () => {
  const app = createServer(accountsRouter);

  const response = await request(app).get("/abc");
  assert.equal(response.status, 400);
  assert.match(response.text, /Account ID must be a number/);
});

test("accounts route returns account details with daily withdrawal total", async () => {
  const originalGetAccount = accountHandler.getAccount;
  const originalGetDaily = transactionHandler.getDailyWithdrawalTotal;

  (accountHandler as any).getAccount = async () => ({
    account_number: 7,
    name: "Sample User",
    amount: 1500,
    type: "checking",
    credit_limit: null,
  });
  (transactionHandler as any).getDailyWithdrawalTotal = async () => 125;

  try {
    const app = createServer(accountsRouter);
    const response = await request(app).get("/7");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      account_number: 7,
      name: "Sample User",
      amount: 1500,
      type: "checking",
      credit_limit: null,
      dailyWithdrawn: 125,
    });
  } finally {
    (accountHandler as any).getAccount = originalGetAccount;
    (transactionHandler as any).getDailyWithdrawalTotal = originalGetDaily;
  }
});

test("transactions route rejects invalid withdrawal payloads before reaching business logic", async () => {
  const app = createServer(transactionsRouter);

  const response = await request(app)
    .put("/13/withdraw")
    .send({ amount: 0 })
    .set("Content-Type", "application/json");

  assert.equal(response.status, 400);
  assert.match(response.text, /Amount must be greater than 0\./);
});

test("transactions route delegates valid withdrawal requests", async () => {
  const originalWithdrawal = transactionHandler.withdrawal;
  (transactionHandler as any).withdrawal = async () => ({
    account_number: 10,
    amount: 350,
    type: "checking",
    dailyWithdrawn: 350,
  });

  try {
    const app = createServer(transactionsRouter);
    const response = await request(app)
      .put("/10/withdraw")
      .send({ amount: 50 })
      .set("Content-Type", "application/json");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      account_number: 10,
      amount: 350,
      type: "checking",
      dailyWithdrawn: 350,
    });
  } finally {
    (transactionHandler as any).withdrawal = originalWithdrawal;
  }
});

test("transactions route delegates valid deposit requests", async () => {
  const originalDeposit = transactionHandler.deposit;
  (transactionHandler as any).deposit = async () => ({
    account_number: 10,
    amount: 825,
    type: "checking",
  });

  try {
    const app = createServer(transactionsRouter);
    const response = await request(app)
      .put("/10/deposit")
      .send({ amount: 125 })
      .set("Content-Type", "application/json");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      account_number: 10,
      amount: 825,
      type: "checking",
    });
  } finally {
    (transactionHandler as any).deposit = originalDeposit;
  }
});