// popup.js

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get({ problems: [] }, async function (data) {
    const problems = data.problems;
    console.log(problems);
    await displayProblems(problems);
  });

  document.getElementById('addProblemBtn').addEventListener('click', () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        // console.log(tabs[0].url);
        const currentUrl = tabs[0].url;
        if (
          currentUrl.startsWith('https://leetcode.com/problems/') &&
          currentUrl.split('/')[currentUrl.split('/').length - 1] !== 'all'
        ) {
          const url = tabs[0].url;
          console.log(url);
          const problemName = await extractProblemNameFromUrl(url);
          console.log(problemName);
          chrome.runtime.sendMessage({
            action: 'addProblem',
            problemName: problemName,
          });
        }
      }
    );
  });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'local' && 'problems' in changes) {
    // Update the UI with the latest problems
    const problems = changes.problems.newValue;
    console.log(problems);
    displayProblems(problems);
  }
});

function displayProblems(problems) {
  const problemList = document.getElementById('problemList');
  problemList.innerHTML = ''; // Clear existing list

  problems.forEach((problem, index) => {
    const listItem = document.createElement('li');

    // Create an anchor element with the problem name as the text content
    const anchor = document.createElement('a');
    anchor.textContent = problem.name;

    // Set the href attribute of the anchor element to the LeetCode problem URL
    anchor.href = `https://leetcode.com/problems/${problem.name}/`;

    // Make the link open in a new tab
    anchor.target = '_blank';

    // Append the anchor element to the list item
    listItem.appendChild(anchor);

    // Append the list item to the problemList
    problemList.appendChild(listItem);
  });
}

const extractProblemNameFromUrl = (url) => {
  //   console.log('HELLO');
  const problemName = url.split('/');
  //   console.log(problemName);
  while (problemName[problemName.length - 1] === '') {
    problemName.pop();
  }
  return problemName[problemName.length - 1];
};
