import assert from 'node:assert';
import net from 'node:net';

export const networkUtil = {
  getRandomPort,
};

/**
 * Finds and returns a random free port.
 *
 * Based on
 * https://github.com/nestjs/nest/blob/8292384b8782975d56285d1ad0c81d13cd97663a/integration/nest-application/get-url/e2e/utils.ts#L5
 * @returns {Promise<number>} Port number
 */
async function getRandomPort() {
  const server = net.createServer();
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      assert(typeof address === 'object' && address !== null);
      const { port } = address;
      server.close();
      resolve(port);
    });
  });
}
