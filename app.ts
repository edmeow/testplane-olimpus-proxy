import Testplane, { ConfigInput, TestResult } from "testplane";
import express from "express";
import ProxyManager from "./src/ProxyManager";
import testplaneConfig from "./testplane.config";

const app = express();
const port = 3000;

const testplane = new Testplane(testplaneConfig);

testplane.on(testplane.events.ERROR, (error) => {
  console.info(error);
});

app.use(express.json());

app.get("/:id", (req, res) => {
  const solution = ProxyManager.getSolutionById(parseInt(req.params.id));

  if (!solution) {
    res.status(404).send();
    return;
  }

  res.status(200).json({ status: solution.state, results: solution.results });
});

app.get("/run/project", async (req, res) => {
  const testUrl = req.query.testUrl as string;
  const solutionEntryPointUrl = req.query.solutionEntryPointUrl as string;
  const answerId = parseInt(req.query.answerId as string);

  const resolvedSolution = ProxyManager.getSolutionById(answerId);

  if (resolvedSolution) {
    res.status(200).send();
    return;
  }
  ProxyManager.promisePendingProject(answerId);

  if (ProxyManager.isLock()) await ProxyManager.waitForUnlock();

  ProxyManager.addPendingProject(answerId, solutionEntryPointUrl);

  const testPassListener = (test: TestResult) => {
    ProxyManager.addResultToSolution(answerId, {
      id: test.id,
      title: test.fullTitle(),
      pass: true,
    });
  };

  const testFailListener = (test: TestResult) => {
    ProxyManager.addResultToSolution(answerId, {
      id: test.id,
      title: test.fullTitle(),
      pass: false,
      message: test.err?.message,
    });
  };

  testplane.on(testplane.events.TEST_PASS, testPassListener);

  testplane.on(testplane.events.TEST_FAIL, testFailListener);

  testplane.once(testplane.events.SUITE_END, () => {
    ProxyManager.resolve(answerId);
    testplane.removeListener(testplane.events.TEST_PASS, testPassListener);
    testplane.removeListener(testplane.events.TEST_FAIL, testFailListener);
  });

  testplane.run([testUrl]);

  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
