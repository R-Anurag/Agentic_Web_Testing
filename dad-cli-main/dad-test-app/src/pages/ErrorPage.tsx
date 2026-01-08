export default function ErrorPage() {
  function brokenAction() {
    fetch("/non-existent-api").then(() => {
      // API fails but UI claims success
      alert("Success!");
    });
  }

  return <button onClick={brokenAction}>Trigger Broken Flow</button>;
}
