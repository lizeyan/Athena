#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTimer>
#include <QPainter>
#include <QPaintEvent>
#include <QPixmap>
#include <QImage>
#include <QLabel>
#include <QMutex>
#include <QTextEdit>

#include "cv.h"
#include "highgui.h"
#include "opencv.hpp"


#include "detectionthread.h"
#include "catchfacetrack.h"

using namespace cv;

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();
    void paintEvent(QPaintEvent *);

public slots:
    void updateImage();
    void getCameraID();
    void connectToService();
    void closeMonitor();
    void sendImageToService();
    void testButtonClick();

private:

    void createMenu();

    int updateDelay;

    QTimer theTimer;

    Mat bgr_image;

    QLabel *imageLabel;

    QTextEdit *imageInfo;

    QMutex *lock;

//    CatchFaceThread catchFaceThread;

//    CatchFaceDetect catchFaceDetect;

    CatchFaceTrack catchFaceTrack;

    int catchFaceCounter;

//    int catchFaceFlag;


    QString cameraID;

    DetectionThread detectionThread;

};

#endif // MAINWINDOW_H
