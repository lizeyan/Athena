#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QHBoxLayout>
#include <QMenu>

#include "cv.h"
#include "highgui.h"
#include "cv_face.h"


MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{

    catchFaceTrack.catchFace();

    ui->setupUi(this);
    this->setWindowTitle("monitor");

    connect(&theTimer, &QTimer::timeout, this, &MainWindow::updateImage);

    //catch vedio from camera

    const int updateDelay=33;   // the time between two update

    if(videoCap.open(1))    //check the camera exist
    {
        srcImage = Mat::zeros(videoCap.get(CV_CAP_PROP_FRAME_HEIGHT), videoCap.get(CV_CAP_PROP_FRAME_WIDTH), CV_8UC3);
        theTimer.start(updateDelay);
    }
    else if(videoCap.open(0))   //check the camera exist
    {
        srcImage = Mat::zeros(videoCap.get(CV_CAP_PROP_FRAME_HEIGHT), videoCap.get(CV_CAP_PROP_FRAME_WIDTH), CV_8UC3);
        theTimer.start(updateDelay);
    }
    imageLabel = new QLabel(this);
    ui->verticalLayout->addWidget(imageLabel);
    createMenu();

    lock=new QMutex();
    catchFaceThread.setLock(lock);
    //catchFaceThread.start();

    catchFaceCounter=catchFaceFlag=0;

    videoCap>>srcImage;
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::paintEvent(QPaintEvent *e)
{
    /*
    // the first way to show the picture
    QPainter painter(this);
    QImage image1 = QImage((uchar*)(srcImage.data), srcImage.cols, srcImage.rows, QImage::Format_RGB888);
    painter.drawImage(QPoint(20,20), image1);*/
    // the second way show the picture
    QImage image2 = QImage((uchar*)(bgr_image.data), bgr_image.cols, bgr_image.rows, QImage::Format_RGB888);
    imageLabel->setPixmap(QPixmap::fromImage(image2));
    imageLabel->resize(image2.size());
    imageLabel->show();

}

void MainWindow::updateImage()
{
    videoCap>>srcImage;
    if(srcImage.data)
    {
        bgr_image=srcImage;

        //cvtColor(srcImage, srcImage, CV_BGR2RGB);//Qt中支持的是RGB图像, OpenCV中支持的是BGR
        if(catchFaceFlag>0||catchFaceCounter>40)
        {
            catchFaceFlag=catchFaceDetect.catchFace(bgr_image);
            catchFaceCounter=0;
        }
        else
            ++catchFaceCounter;
        cvtColor(bgr_image, bgr_image, CV_BGR2RGB);
        //srcImage=bgr_image.clone();
        this->update();  //发送刷新消息
    }
}


void MainWindow::createMenu()
{
    QMenu *menuOfWindow=this->menuBar()->addMenu(tr("&Settings"));
    QAction *actionConnectToService=new QAction(tr("&Connect"),this);
    QAction *actionChangePassword=new QAction(tr("&Password"),this);
    QAction *actionExit=new QAction(tr("&Exit"),this);

    menuOfWindow->addAction(actionConnectToService);
    menuOfWindow->addAction(actionChangePassword);
    menuOfWindow->addAction(actionExit);

    connect(actionConnectToService,SIGNAL(triggered(bool)),this,SLOT(connectToService()));
    connect(actionChangePassword,SIGNAL(triggered(bool)),this,SLOT(changePassword()));
    connect(actionExit,SIGNAL(triggered(bool)),this,SLOT(closeMonitor()));
}

void MainWindow::getCameraID()
{

}

void MainWindow::connectToService()
{
}

void MainWindow::changePassword()
{

}

void MainWindow::closeMonitor()
{
    this->close();
}
