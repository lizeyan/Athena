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
        catchFace();
        //cvtColor(srcImage, srcImage, CV_BGR2RGB);//Qt中支持的是RGB图像, OpenCV中支持的是BGR
        cvtColor(bgr_image, bgr_image, CV_BGR2RGB);
        srcImage=bgr_image.clone();
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

void MainWindow::catchFace()
{
    int points_size = 21;
    int config;
    if (points_size == 21) {
        config = CV_DETECT_ENABLE_ALIGN_21;
    }
    else if (points_size == 106) {
        config = CV_DETECT_ENABLE_ALIGN_106;
    }
    else {
        fprintf(stderr, "alignment point size error, must be 21 or 106\n");
        return;
    }

    // load image
    bgr_image =srcImage.clone();             // CV_PIX_FMT_BGR888
    if (!bgr_image.data) {
        fprintf(stderr, "fail to read\n");//%s\n", input_image_path);
        return;
    }


    // init detect handle
    cv_handle_t handle_detect = NULL;
    cv_result_t cv_result = CV_OK;
    cv_face_t* p_face = NULL;
    int face_count = 0;
    do
    {
        cv_result = cv_face_create_detector(&handle_detect, NULL, config);
        if (cv_result != CV_OK) {
            fprintf(stderr, "cv_face_create_detector failed, error code %d\n", cv_result);
            break;
        }

        /*
         * test get and set threshold
         */
        float default_threshold;
        cv_result = cv_face_detect_get_threshold(handle_detect, &default_threshold);
        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect_get_threshold failed, error code %d\n", cv_result);
            break;
        }
        //fprintf(stderr, "default threshold : %f\n", default_threshold);

        cv_result = cv_face_detect_set_threshold(handle_detect, default_threshold);
        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect_set_threshold failed, error code %d\n", cv_result);
            break;
        }
        fprintf(stderr, "threshold set : %f\n", default_threshold);


        // detect

        cv_result = cv_face_detect(handle_detect, bgr_image.data, CV_PIX_FMT_BGR888,
            bgr_image.cols, bgr_image.rows, bgr_image.step,
            CV_FACE_UP, &p_face, &face_count);

        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect error %d\n", cv_result);
            break;
        }

        if (face_count > 0) {
            // draw result
            for (int i = 0; i < face_count; i++) {
                rectangle(bgr_image, Point(p_face[i].rect.left, p_face[i].rect.top),
                    Point(p_face[i].rect.right, p_face[i].rect.bottom),
                    Scalar(0, 255, 0), 2, 8, 0);
                //fprintf(stderr, "face number: %d\n", i + 1);
                /*fprintf(stderr, "face rect: [%d, %d, %d, %d]\n", p_face[i].rect.top,
                    p_face[i].rect.left,
                    p_face[i].rect.right, p_face[i].rect.bottom);*/
                //fprintf(stderr, "score: %f\n", p_face[i].score);
                /*fprintf(stderr, "face pose: [yaw: %.2f, pitch: %.2f, roll: %.2f, eye distance: %.2f]\n",
                    p_face[i].yaw,
                    p_face[i].pitch, p_face[i].roll, p_face[i].eye_dist);*/
                //fprintf(stderr, "face algin:\n");
                for (unsigned int j = 0; j < p_face[i].points_count; j++) {
                    float x = p_face[i].points_array[j].x;
                    float y = p_face[i].points_array[j].y;
                    //fprintf(stderr, "(%.2f, %.2f)\n", x, y);
                    circle(bgr_image, Point2f(x, y), 2, Scalar(0, 0, 255), -1);
                }
                //fprintf(stderr, "\n");
            }
            // save image
            //imwrite(output_image_path, bgr_image);
        }
        else {
            fprintf(stderr, "can't find face in image\n");// %s", input_image_path);
        }

    } while (0);


    // release the memory of face
    cv_face_release_detector_result(p_face, face_count);
    // destroy detect handle
    cv_face_destroy_detector(handle_detect);

    fprintf(stderr, "test finish!\n");
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
