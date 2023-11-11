// popup.js

document.addEventListener('DOMContentLoaded', async function () {
  await getProblems();

  const problemList = document.getElementById('problemList');
  problemList.addEventListener('change', async (event) => {
    if (event.target.tagName === 'SELECT') {
      console.log(event.target.id);
      const e = document.getElementById(event.target.id);
      console.log(e.options[e.selectedIndex].text);

      const result = await fetch('http://localhost:8000/api/updateProblem', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          problemName: `${event.target.id}`,
          probleStatus: `${e.options[e.selectedIndex].text}`,
        }),
      });

      console.log('Problem Updated');
    }
  });

  document.getElementById('addProblemBtn').addEventListener('click', () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        const currentUrl = tabs[0].url;
        if (
          currentUrl.startsWith('https://leetcode.com/problems/') &&
          currentUrl.split('/')[currentUrl.split('/').length - 1] !== 'all'
        ) {
          const url = tabs[0].url;
          console.log(url);
          const problemName = await extractProblemNameFromUrl(url);
          console.log(problemName);

          const result = await fetch('http://localhost:8000/api/addProblem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              problemName: `${problemName}`,
              problemLink: `${url}`,
              problemStatus: 'Solved',
            }),
          });

          console.log('Response Received');
          let problems = [{ name: `${problemName}`, status: 'Solved' }];

          await getProblems();
        }
      }
    );
  });
});

async function getProblems() {
  const result = await fetch('http://localhost:8000/api/getProblems');
  const problems = await result.json();
  console.log(problems);
  displayProblems(problems);
}

function displayProblems(problems) {
  const problemList = document.getElementById('problemList');
  console.log(problemList);
  problemList.innerHTML = ''; // Clear existing list

  problems.forEach((problem, index) => {
    const listItem = document.createElement('li');
    listItem.className = problem.problemName;

    // Create an anchor element with the problem name as the text content
    const anchor = document.createElement('a');
    anchor.textContent = problem.problemName;

    // Set the href attribute of the anchor element to the LeetCode problem URL
    anchor.href = `https://leetcode.com/problems/${problem.problemName}/`;

    // Make the link open in a new tab
    anchor.target = '_blank';

    // Create a dropdown list
    const dropdown = document.createElement('select');
    dropdown.id = `${problem.problemName}`;

    // Add options for each status
    const statusOptions = ['Solved', 'Unsolved', 'Revise'];
    statusOptions.forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      // Set the selected attribute for the current status
      if (status === problem.problemStatus) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });

    // Append the anchor and toggle button to the list item
    listItem.appendChild(anchor);
    listItem.appendChild(dropdown);

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
