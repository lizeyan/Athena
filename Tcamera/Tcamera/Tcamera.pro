#-------------------------------------------------
#
# Project created by QtCreator 2016-09-30T16:15:43
#
#-------------------------------------------------

QT       += core gui
QT       += network

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = Tcamera
TEMPLATE = app


SOURCES += main.cpp\
        mainwindow.cpp \
    catchfacedetect.cpp \
    catchfacetrack.cpp \
    infoapi.cpp \
    json/jsoncpp.cpp \
    facedetection.cpp \
    faceidentification.cpp \
    detectionthread.cpp

HEADERS  += mainwindow.h \
    catchfacedetect.h \
    catchfacetrack.h \
    infoapi.h \
    json/json.h \
    json/json-forwards.h \
    facedetection.h \
    faceidentification.h \
    detectionthread.h

FORMS    +=


INCLUDEPATH+=D:\OpenCV\OpenCV\install\include\opencv\
             D:\OpenCV\OpenCV\install\include\opencv2\
             D:\OpenCV\OpenCV\install\include\
             D:\OpenCV\st_face-6.2.0-detect_p1-windows-6c0c82f\include\
             D:\OpenCV\curl-7.50.3-win32-mingw\include


LIBS+=D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_calib3d2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_contrib2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_core2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_features2d2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_flann2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_gpu2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_highgui2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_imgproc2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_legacy2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_ml2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_objdetect2413.dll.a\
      D:\OpenCV\OpenCV\install\x86\mingw\lib\libopencv_video2413.dll.a\
      D:\OpenCV\st_face-6.2.0-detect_p1-windows-6c0c82f\libs\windows-x86\cvface_api.lib\
      D:\OpenCV\curl-7.50.3-win32-mingw\lib\libcurldll.a\
      D:\OpenCV\curl-7.50.3-win32-mingw\lib\libcurl.a\




