async function extractProblemNameFromUrl(url) {
  //   console.log('HELLO');
  const problemName = url.split('/');
  //   console.log(problemName);
  while (problemName[problemName.length - 1] === '') {
    problemName.pop();
  }
  return problemName[problemName.length - 1];
}

export default extractProblemNameFromUrl;
