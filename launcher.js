import pm2 from 'pm2';

pm2.connect((err) => {
   if (err) {
      console.error(err);
      process.exit();
   }

   pm2.start({
      name: 'client',
      script: 'pnpm',
      interpreter: 'cmd',
      args: ['dev'],
      cwd: './client'
   }, (err, apps) => {
      if (err) {
         console.error(err);
         pm2.disconnect();
      }
      console.log('Running client');
   })
})