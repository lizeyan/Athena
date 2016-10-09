#-------------------------------------------------
#
# Project created by QtCreator 2016-10-08T23:32:08
#
#-------------------------------------------------

QT       += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = Android
TEMPLATE = app


SOURCES += main.cpp\
        widget.cpp \
    catchfacetrack.cpp

HEADERS  += widget.h \
    catchfacetrack.h

FORMS    +=

CONFIG += mobility


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

unix {
message("Using unix configuration")
ANDROID_OPENCV = D:\android\OpenCV-android-sdk\sdk\native


INCLUDEPATH += \
$$ANDROID_OPENCV/jni/include/opencv    \
$$ANDROID_OPENCV/jni/include/opencv2    \
$$ANDROID_OPENCV/jni/include            \


LIBS += \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_ml.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_objdetect.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_calib3d.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_video.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_features2d.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_highgui.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_flann.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_imgproc.a \
$$ANDROID_OPENCV/libs/armeabi-v7a/libopencv_core.a     \
$$ANDROID_OPENCV/3rdparty/libs/armeabi-v7a/liblibjpeg.a \
$$ANDROID_OPENCV/3rdparty/libs/armeabi-v7a/liblibpng.a \
$$ANDROID_OPENCV/3rdparty/libs/armeabi-v7a/liblibtiff.a \
$$ANDROID_OPENCV/3rdparty/libs/armeabi-v7a/liblibjasper.a \
$$ANDROID_OPENCV/3rdparty/libs/armeabi-v7a/libtbb.a


}


MOBILITY =


