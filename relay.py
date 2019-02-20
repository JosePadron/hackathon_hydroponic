#!/usr/bin/python
from __future__ import print_function

import sys
import time

sys.path.insert(0, '/usr/github/hackathon_hydroponic/Seeed-Studio-Relay-Board/')

from relay_lib_seeed_update import *

# Now see what we're supposed to do next
if __name__ == "__main__":
   relay = int(sys.argv[1]);
   state = int(sys.argv[2]);

   relay_set_port_data(relay_get_port_data(1));

   if 0 == state:
     relay_off(relay);
   else:
     relay_on(relay);  
    # exit the application
   sys.exit(0)
