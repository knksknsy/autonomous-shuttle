### Redirect:80:4200

from 80 to 4200 just execute:

iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 4200
