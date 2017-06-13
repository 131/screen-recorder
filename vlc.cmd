vlc\vlc.exe --no-screen-follow-mouse --ignore-config --no-plugins-cache --verbose=10 --no-media-library --config=blank --intf=dummy --dummy-quiet --screen-fps=20 --screen-top=0 --screen-left=0 --screen-width=1920 --screen-height=1080 --run-time=10 --width=1920 --height=1080 --no-crashdump --file-logging --logfile=vlc-log.txt --sout=#transcode{vcodec=x264,vb=10240,fps=30,acodec=none,scale=auto,width=1920,height=1080,venc=qsv{vcodec=h264,scale=1}}:duplicate{dst=std{access=file,mux=mp4,dst="out.mp4"}} screen:// vlc://quit


REM vlc\vlc.exe --no-screen-follow-mouse --ignore-config  --no-plugins-cache --verbose=10 --no-media-library --config=NUL --intf=dummy  --screen-fps=30 --screen-top=0 --screen-left=0 --screen-width=1920 --screen-height=1080 --run-time=20 --no-crashdump --sout=#transcode{vcodec=x264,fps=30,acodec=none,venc=x264{preset=ultrafast,profile=baseline,crf=0}}:duplicate{dst=std{access=file,mux=mp4,dst="test.mp4"}} --file-logging --logfile=vlc-log.txt screen:// vlc://quit




REM vlc\vlc.exe --no-screen-follow-mouse --ignore-config  --no-plugins-cache --verbose=10 --no-media-library --config=NUL --intf=dummy  --screen-fps=30 --screen-top=0 --screen-left=0 --screen-width=1920 --screen-height=1080 --run-time=20 --no-crashdump --sout=#transcode{fps=30,acodec=none,venc=qsv{vcodec=h264,preset=ultrafast,profile=baseline,crf=0,width=1920,height=1080,fps=30},width=1920,height=1080}:duplicate{dst=std{access=file,mux=mp4,dst="test.mp4"}} --file-logging --logfile=vlc-log.txt screen:// vlc://quit


