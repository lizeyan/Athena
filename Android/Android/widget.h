#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>
#include "highgui.h"
#include "cv.h"

using namespace cv;

class Widget : public QWidget
{
    Q_OBJECT

public:

    Mat bgrImage;

    explicit Widget(QWidget *parent = 0);
    ~Widget();

};

#endif // WIDGET_H
