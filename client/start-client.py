import subprocess
import socket

def checkPort(host, port):
   with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
      try:
         s.settimeout(0.5)
         s.connect((host, port))
         return True
      except OSError:
         return False

isPortInUse = checkPort('localhost', 5173)

if isPortInUse:
   print('Port 5173 is in use. Server not started')
   exit()

process = subprocess.Popen(["powershell", "-Command", "pnpm dev --host"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

while True:
   try:
      output = process.stdout.readline().decode("utf-8").rstrip()
      if output:
         print(output)
   except UnicodeEncodeError:
      print('Could not parse line')

exit_code = process.wait()

if exit_code != 0:
   print(f"Error: Process exited with code {exit_code}")