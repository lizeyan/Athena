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

    ui->setupUi(this);
    this->setWindowTitle("monitor");

    connect(&theTimer, &QTimer::timeout, this, &MainWindow::updateImage);

    //catch vedio from camera

    const int updateDelay=33;

    if(catchFaceTrack.open(bgr_image))
    {
        theTimer.start(updateDelay);
    }

    imageLabel = new QLabel(this);
    ui->verticalLayout->addWidget(imageLabel);
    createMenu();

    lock=new QMutex();
    catchFaceThread.setLock(lock);

    catchFaceCounter=catchFaceFlag=0;
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::paintEvent(QPaintEvent *e)
{
    // show the picture
    QImage image2 = QImage((uchar*)(bgr_image.data), bgr_image.cols, bgr_image.rows, QImage::Format_RGB888);
    imageLabel->setPixmap(QPixmap::fromImage(image2));
    imageLabel->resize(image2.size());
    imageLabel->show();

}

void MainWindow::updateImage()
{
    catchFaceTrack.catchFace(bgr_image);
    if(bgr_image.data)
    {
        //bgr_image=srcImage;
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
