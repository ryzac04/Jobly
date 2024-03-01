"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    id: 4,
    companyHandle: "c1",
    title: "New",
    salary: 1000,
    equity: "0.8",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
                companyHandle: "c1",
    title: "New",
    salary: 1000,
    equity: "0.8"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({job: newJob});
  });

  test("error due to not admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          companyHandle: "new"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "J1",
                        salary: 100,
                        equity: "0.1",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J2",
                        salary: 200,
                        equity: "0.2",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J3",
                        salary: 300,
                        equity: null,
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
        });
    });

    test("works: filter", async () => {
        const resp = await request(app).get("/jobs")
            .query({ hasEquity: true });
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "J1",
                        salary: 100,
                        equity: "0.1",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J2",
                        salary: 200,
                        equity: "0.2",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
        });
    });

    test("works: all filters used", async () => {
        const resp = await request(app).get("/jobs")
            .query({ minSalary: 100, hasEquity: true, title: "j" });
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "J1",
                        salary: 100,
                        equity: "0.1",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                    {
                        id: expect.any(Number),
                        title: "J2",
                        salary: 200,
                        equity: "0.2",
                        companyHandle: "c1",
                        companyName: "C1",
                    },
                ],
        });
    });

    test("bad request if invalid filter key", async () => {
        const resp = await request(app).get("/jobs")
            .query({ minSalary: 100, hasEquity: true, not_title: "j" });
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[1]}`);
    expect(resp.body).toEqual({
        job: {
            id: testJobIds[1],
            title: "J2",
            salary: 200,
            equity: "0.2",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "New Title",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        name: "New Title",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          equity: 1,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
      const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/jobs/999`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
