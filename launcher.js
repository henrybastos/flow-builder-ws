import pm2 from 'pm2';

process.on('message', function(msg) {
   console.log('[message]', msg);
   if (msg == 'shutdown') {
     console.log('Closing all connections...')
     setTimeout(function() {
       console.log('Finished closing connections')
       process.exit(0)
     }, 1500)
   }
 })

pm2.connect((err) => {
   if (err) {
      console.error('[ERROR::fb-launcher]', err);
      process.exit();
   }

   pm2.start({
      name: 'fb-client-ws',
      script: 'start-client.py',
      cwd: './client',
      autorestart: false,
      shutdown_with_message: true
   }, (err, apps) => {
      if (err) {
         console.error('[ERROR::fb-client-ws]', err);
         pm2.disconnect();
      }
      console.log('Running client');
   })
   
   pm2.start({
      name: 'fb-server-ws',
      script: 'main.js',
      cwd: './server',
      autorestart: false,
      shutdown_with_message: true
   }, (err, apps) => {
      if (err) {
         console.error('[ERROR::fb-server-ws]', err);
         pm2.disconnect();
      }
      console.log('Running server');
   })
})