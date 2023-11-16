// popup.js
import getProblems from './functions/getProblems.js';
import extractProblemNameFromUrl from './functions/extractProblemNameFromUrl.js';

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

  const manageProblemsBtn = document.getElementById('manageProblemsBtn');
  manageProblemsBtn.addEventListener('click', async (event) => {
    console.log('Manage Problems Button Clicked');
    console.log(event.target);
    const message = await fetch('http://localhost:8000/api/authenticate');
    const authorizeUrl = await message.json();
    console.log(authorizeUrl.url);
    if (authorizeUrl.message == 'NOT DONE') {
      window.open(authorizeUrl.url, '_blank');
    }
    const data = await fetch('http://localhost:8000/api/createSpreadSheet');

    console.log('received spread sheet id now updating sheet');
    const spreadSheetId = await data.json();
    console.log(spreadSheetId.spreadsheetId);

    const result = await fetch('http://localhost:8000/api/updateSheet', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        spreadSheetId: `${spreadSheetId.spreadsheetId}`,
      }),
    });
    console.log('DONE');
    console.log(result);
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
