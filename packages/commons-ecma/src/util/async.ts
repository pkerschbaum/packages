async function wait(waitForMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, waitForMs);
  });
}

export = {
  asyncUtils: { wait },
};
