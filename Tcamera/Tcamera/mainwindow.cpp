#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QHBoxLayout>

#include "cv.h"
#include "highgui.h"


MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setWindowTitle("monitor");

    connect(&theTimer, &QTimer::timeout, this, &MainWindow::updateImage);

    //catch vedio from camera

    if(videoCap.open(1))
    {
        srcImage = Mat::zeros(videoCap.get(CV_CAP_PROP_FRAME_HEIGHT), videoCap.get(CV_CAP_PROP_FRAME_WIDTH), CV_8UC3);
        theTimer.start(33);
    }
    else if(videoCap.open(0))
    {
        srcImage = Mat::zeros(videoCap.get(CV_CAP_PROP_FRAME_HEIGHT), videoCap.get(CV_CAP_PROP_FRAME_WIDTH), CV_8UC3);
        theTimer.start(33);
    }
    imageLabel = new QLabel(this);
    ui->verticalLayout->addWidget(imageLabel);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::paintEvent(QPaintEvent *e)
{
    /*
    //显示方法一
    QPainter painter(this);
    QImage image1 = QImage((uchar*)(srcImage.data), srcImage.cols, srcImage.rows, QImage::Format_RGB888);
    painter.drawImage(QPoint(20,20), image1);*/
    //显示方法二
    QImage image2 = QImage((uchar*)(srcImage.data), srcImage.cols, srcImage.rows, QImage::Format_RGB888);
    imageLabel->setPixmap(QPixmap::fromImage(image2));
    imageLabel->resize(image2.size());
    imageLabel->show();
}

void MainWindow::updateImage()
{
    videoCap>>srcImage;
    if(srcImage.data)
    {
        cvtColor(srcImage, srcImage, CV_BGR2RGB);//Qt中支持的是RGB图像, OpenCV中支持的是BGR
        this->update();  //发送刷新消息
    }
}

