#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QHBoxLayout>
#include <QVBoxLayout>
#include <QMenu>
#include <QPushButton>

#include "cv.h"
#include "highgui.h"
#include "cv_face.h"



MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent)
{



    this->setWindowTitle(tr("monitor"));

    connect(&theTimer, &QTimer::timeout, this, &MainWindow::updateImage);

    //catch vedio from camera

    updateDelay=33;

    if(catchFaceTrack.open(bgr_image))
    {
        theTimer.start(updateDelay);
    }

    imageLabel = new QLabel(this);
    imageInfo = new QTextEdit(this);

    imageInfo->setText("");

    imageInfo->setReadOnly(true);

    createMenu();

    //catchFaceThread.setLock(lock);

    //catchFaceCounter=catchFaceFlag=0;
    catchFaceCounter=0;

    QPushButton *testButton=new QPushButton();

    QVBoxLayout *vLayout=new QVBoxLayout();
    QWidget *widget=new QWidget(this);
    widget->setLayout(vLayout);

    QWidget *hWidget=new QWidget(widget);
    QHBoxLayout *hLayout=new QHBoxLayout();
    hWidget->setLayout(hLayout);

    hLayout->addWidget(imageLabel);
    hLayout->addWidget(imageInfo);

    vLayout->addWidget(hWidget);
    vLayout->addWidget(testButton);

    testButton->setText(tr("clicked this button to test program"));

    this->setCentralWidget(widget);

    connect(&detectionThread,SIGNAL(newPerson(QString)),this,SLOT(changeText(QString)));

    detectionThread.api_id=QString("332cc3d4d63e404693589ca02da83600");
    detectionThread.api_secret=QString("72e68c866c34405c8491839da7ffd4d0");

}

MainWindow::~MainWindow()
{
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
    int face_count=catchFaceTrack.catchFace(bgr_image,false);;
    if(catchFaceCounter*updateDelay>500&&face_count>0)
    {
        detectionThread.writingLock.lock();
        bool isWriting=detectionThread.isWriting;
        detectionThread.writingLock.unlock();
        if(!detectionThread.isWriting)
        {
            catchFaceCounter=0;
            face_count=catchFaceTrack.catchFace(bgr_image,true);
            detectionThread.faceCount=face_count;
            detectionThread.start();
        }
        else
        {
            face_count=catchFaceTrack.catchFace(bgr_image,false);
        }
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
    }
}

static int textCounter=0;

void MainWindow::changeText(QString text)
{
    ++textCounter;
    if(textCounter>10)
    {
        textCounter=0;
        imageInfo->setText("");
    }
    imageInfo->setText(imageInfo->toPlainText()+text+"\n");
}
