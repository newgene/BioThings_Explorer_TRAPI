const WorkflowError = require("./errors/workflow_error");
const URL = require("url").URL;

exports.removeQuotesFromQuery = (queryString) => {
    if (queryString.startsWith('"') && queryString.endsWith('"')) {
        return queryString.slice(1, -1);
    } else if (queryString.startsWith("'") && queryString.endsWith("'")) {
        return queryString.slice(1, -1);
    } else {
        return queryString;
    }
}

exports.validateWorkflow = (workflow) => {
    if (workflow === undefined) {
        return;
    }
    if (!Array.isArray(workflow) || workflow.length !== 1 || workflow[0].id !== 'lookup') {
        throw new WorkflowError("BTE doesn't handle the operations specified in the workflow field.");
    }
}

exports.stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};
