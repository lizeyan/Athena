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

using namespace cv;

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();/*
    void paintEvent(QPaintEvent *);

public slots:
    void updateImage();
*/
private:

    QTimer theTimer;
    Mat srcImage;
    //VideoCapture videoCap;
    QLabel *imageLabel;

    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
