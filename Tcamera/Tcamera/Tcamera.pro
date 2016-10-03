#-------------------------------------------------
#
# Project created by QtCreator 2016-09-30T16:15:43
#
#-------------------------------------------------

QT       += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = Tcamera
TEMPLATE = app


SOURCES += main.cpp\
        mainwindow.cpp

HEADERS  += mainwindow.h

FORMS    += mainwindow.ui


INCLUDEPATH+=D:\OpenCV\build\install\include\opencv\
             D:\OpenCV\build\install\include\opencv2\
             D:\OpenCV\build\install\include\
             D:\OpenCV\st_face-6.2.0-detect_p1-windows-6c0c82f\include

LIBS+=D:\OpenCV\build\install\x86\mingw\lib\libopencv_calib3d2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_contrib2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_core2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_features2d2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_flann2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_gpu2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_highgui2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_imgproc2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_legacy2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_ml2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_objdetect2413.dll.a\
      D:\OpenCV\build\install\x86\mingw\lib\libopencv_video2413.dll.a\
      D:\OpenCV\st_face-6.2.0-detect_p1-windows-6c0c82f\libs\windows-x86\cvface_api.lib
