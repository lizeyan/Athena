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
    this->setWindowTitle(tr("monitor"));

    connect(&theTimer, &QTimer::timeout, this, &MainWindow::updateImage);

    //catch vedio from camera

    updateDelay=33;

    if(catchFaceTrack.open(bgr_image))
    {
        theTimer.start(updateDelay);
    }

    imageLabel = new QLabel(this);
    imageInfo = new QLabel(this);
    QPalette pa;
    pa.setColor(QPalette::WindowText,Qt::red);
    imageInfo->setPalette(pa);
    imageInfo->setText(tr("此处将显示与图片相关的文字信息"));

    ui->verticalLayout->addWidget(imageLabel);
    ui->verticalLayout->addWidget(imageInfo);

    ui->testButton->setEnabled(true);

    connect(ui->testButton,SIGNAL(clicked()),this,SLOT(testButtonClick()));

    createMenu();

    lock=new QMutex();
    //catchFaceThread.setLock(lock);

    //catchFaceCounter=catchFaceFlag=0;
    catchFaceCounter=0;
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
    ++catchFaceCounter;
    int face_count;
    if(catchFaceCounter*updateDelay<500)
        face_count=catchFaceTrack.catchFace(bgr_image,false);
    else
    {
        face_count=catchFaceTrack.catchFace(bgr_image,false);
        sendImageToService();
    }
    //fprintf(stderr, "catch face number : %d\n", face_count);
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
    QAction *actionExit=new QAction(tr("&Exit"),this);

    menuOfWindow->addAction(actionConnectToService);
    menuOfWindow->addAction(actionExit);

    connect(actionConnectToService,SIGNAL(triggered(bool)),this,SLOT(connectToService()));
    connect(actionExit,SIGNAL(triggered(bool)),this,SLOT(closeMonitor()));
}

void MainWindow::getCameraID()
{

}

void MainWindow::connectToService()
{
    getCameraID();
}

void MainWindow::closeMonitor()
{
    this->close();
}

void MainWindow::sendImageToService()
{

}

void MainWindow::testButtonClick()
{
    imageInfo->setText(tr("test"));
    catchFaceTrack.catchFace(bgr_image,true);
    if(bgr_image.data)
    {
        //bgr_image=srcImage;
        cvtColor(bgr_image, bgr_image, CV_BGR2RGB);
        //srcImage=bgr_image.clone();
        this->update();  //发送刷新消息
        sendImageToService();
    }
}
