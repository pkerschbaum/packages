async function convertBlobToDataURL(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return `data:${blob.type};base64,${buffer.toString('base64')}`;
}

export = {
  binaryUtils: {
    convertBlobToDataURL,
  },
};
