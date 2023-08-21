const { describe, it } = require("node:test");

const request = require("supertest");
const assert = require("assert");

const { app } = require("./index");

it("GET /users", async () => {
  await request(app).get("/users").expect("Content-Type", /json/).expect(200);
});
