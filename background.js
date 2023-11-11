// background.js
// Example: using chrome.storage to store problems
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'addProblem') {
    //console.log('request received');
    // Get the current list of problems
    chrome.storage.local.get({ problems: [] }, function (data) {
      const problems = data.problems;
      //console.log(problems);
      // Use the problemName from the message or prompt the user
      const problemName =
        request.problemName || prompt('Enter the name of the problem:');
      //console.log(problemName);
      // Add the problem to the list
      problems.push({ name: problemName, status: solved });
      //console.log(problems);
      // Save the updated list
      chrome.storage.local.set({ problems: problems }, function () {
        console.log('Problem added!');
      });
    });
  }
});
