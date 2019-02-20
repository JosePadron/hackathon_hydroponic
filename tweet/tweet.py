from twython import Twython


# fill in your 4 keys in following variables
C_key = "IVoABm79IWmZ8S3L2gwUR7cgv"
C_secret = "JxUTw6ixTtp4gl7kyfERaALqZ0MY9s9430dtAuM6DYyOu8Sbyu"
A_token = "1097567943179804672-CUMJDtzUkHGL2SOniGMlpcfNZrn7uv"
A_secret = "ZVdXNiNZVXALHsEN08kaOASXSFMOmy06NvhVtAkMEPwPs"

myTweet = Twython(C_key,C_secret,A_token,A_secret)
#myTweet.update_status(status="Tweeting from my Fridge with Hydroponics")

from twython import Twython

# fill in your 4 keys in following variables
C_key = "IVoABm79IWmZ8S3L2gwUR7cgv"
C_secret = "JxUTw6ixTtp4gl7kyfERaALqZ0MY9s9430dtAuM6DYyOu8Sbyu"
A_token = "1097567943179804672-CUMJDtzUkHGL2SOniGMlpcfNZrn7uv"
A_secret = "ZVdXNiNZVXALHsEN08kaOASXSFMOmy06NvhVtAkMEPwPs"

myTweet = Twython(C_key,C_secret,A_token,A_secret)
#myTweet.update_status(status="Tweeting from my Fridge")
#twitter.update_status_with_media(status='Check out my Garden', media='/home/pi/Pictures/image.jpg')

#insert image address below
photo = open('/home/pi/Pictures/image.jpg', 'rb')
response = myTweet.upload_media(media=photo)
myTweet.update_status(status='Check out how my Hydroponics is looking! :)', media_ids=[response['media_id']])
