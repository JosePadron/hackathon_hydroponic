from twython import Twython


# fill in your 4 keys in following variables
C_key = "IVoABm79IWmZ8S3L2gwUR7cgv"
C_secret = "JxUTw6ixTtp4gl7kyfERaALqZ0MY9s9430dtAuM6DYyOu8Sbyu"
A_token = "1097567943179804672-CUMJDtzUkHGL2SOniGMlpcfNZrn7uv"
A_secret = "ZVdXNiNZVXALHsEN08kaOASXSFMOmy06NvhVtAkMEPwPs"

myTweet = Twython(C_key,C_secret,A_token,A_secret)
myTweet.update_status(status="Tweeting from my Fridge with Hydroponics")
