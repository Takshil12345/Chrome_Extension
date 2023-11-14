function displayProblems(problems, present) {
  const problemList = document.getElementById('problemList');
  problemList.innerHTML = ''; // Clear existing list

  problems.forEach((problem, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'problem-list-item';

    const container = document.createElement('div');
    container.className = 'container';

    const roundedBox = document.createElement('div');
    roundedBox.className = 'rounded-box';
    roundedBox.textContent = problem.problemName;

    const anchor = document.createElement('a');

    anchor.href = `https://leetcode.com/problems/${problem.problemName}/`;

    anchor.target = '_blank';

    anchor.appendChild(roundedBox);

    const dropdown = document.createElement('select');
    dropdown.id = `${problem.problemName}`;
    dropdown.className = 'status-dropdown';

    const statusOptions = ['Solved', 'Unsolved', 'Revise'];
    statusOptions.forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;

      if (status === problem.problemStatus) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });

    container.appendChild(anchor);
    container.appendChild(dropdown);

    listItem.appendChild(container);

    problemList.appendChild(listItem);
  });
}

export default displayProblems;
