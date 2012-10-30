function number_only(myfield, e, dec)
{
    var key;
    var keychar;
    var field = myfield;

    if (window.event)
        key = window.event.keyCode;
    else if (e)
        key = e.which;
    else
        return true;

    if ((key == null) || (key==37) || (key==39) || (key==8) || (key==46) || (key==27) )
    {
        if (((key==46) || (key==8)))
        {
            if (field.value.indexOf('0') > 0)
            {
                field.value = '1';
                return false;
            }
        }
        return true;
    }

    if ((key > 47 && key < 58) || (key > 95 && key < 106))
    {
        if ((key == 48 || key == 96) && field.value > 0)
        {
            if (field.value > 998)
                return false;

            field.value += '0';
            return false;
        }
        else if ((key == 48 || key == 96) && field.value == '')
        {
            return false;
        }

        return true;

    }
    else
    {
        return false;
    }
}