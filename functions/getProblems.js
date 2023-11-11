import displayProblems from './displayProblems.js';

async function getProblems() {
  const result = await fetch('http://localhost:8000/api/getProblems');
  const problems = await result.json();
  console.log(problems);
  displayProblems(problems);
}

export default getProblems;
