from account.interface import JSONResponse


def method_required(mthd):
    def mthd_wrap(func):
        def wrap_func(request, *args, **kwargs):
            if not request.method == mthd:
                responseMess = {"status": "METHOD_NOT_ALLOW", }
                return JSONResponse(responseMess, status=405)
            return func(request, *args, **kwargs)
        return wrap_func
    return mthd_wrap