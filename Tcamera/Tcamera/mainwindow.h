#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTimer>
#include <QPainter>
#include <QPaintEvent>
#include <QPixmap>
#include <QImage>
#include <QLabel>

#include "cv.h"
#include "highgui.h"
#include "opencv.hpp"

#include "catchfacethread.h"
#include "catchfacedetect.h"
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
    void getCameraID();

public slots:
    void updateImage();
    void changePassword();
    void connectToService();
    void closeMonitor();

private:

    QTimer theTimer;

    Mat srcImage,bgr_image;

    VideoCapture videoCap;

    QLabel *imageLabel;

    QMutex *lock;

    CatchFaceThread catchFaceThread;

    CatchFaceDetect catchFaceDetect;

    CatchFaceTrack catchFaceTrack;

    int catchFaceCounter;

    int catchFaceFlag;


    QString cameraID;

    Ui::MainWindow *ui;

    void createMenu();
};

#endif // MAINWINDOW_H
