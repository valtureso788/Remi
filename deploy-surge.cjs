const { spawn } = require('child_process');

const surge = spawn('npx', ['surge', './dist', 'remi-furniture-app.surge.sh'], {
  shell: true
});

surge.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  if (output.toLowerCase().includes('email:')) {
    surge.stdin.write('remi-deploy-bot123@example.com\n');
  } else if (output.toLowerCase().includes('password:')) {
    surge.stdin.write('remi-deploy-pass123\n');
  }
});

surge.stderr.on('data', (data) => {
  process.stderr.write(data);
});

surge.on('close', (code) => {
  console.log(`\nSurge exited with code ${code}`);
});
