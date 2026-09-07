$ErrorActionPreference = 'Stop'
$env:COREPACK_HOME = 'D:\DevTools\Corepack'
& 'D:\software\nodevms\corepack.cmd' pnpm install --frozen-lockfile
& 'D:\software\nodevms\corepack.cmd' pnpm quality

