/**
 * Created with JetBrains WebStorm.
 * User: caio.franchi
 * Date: 19/09/12
 * Time: 16:23
 */
if(!String.prototype.capitalize) {
    String.prototype.capitalize = function(){
        return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1 + p2.toUpperCase(); } );
    };
}

if(!String.prototype.truncate) {
    String.prototype.truncate = function (n, useWordBoundary) {
        var toLong = this.length > n,
            s_ = toLong ? this.substr(0, n-1) : this;
        s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
        return  toLong ? s_ +'...' : s_;
    };
}

if(!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (de, para){
        var str = this;
        var pos = str.indexOf(de);
        while (pos > -1){
            str = str.replace(de, para);
            pos = str.indexOf(de);
        }
        return (str);
    }
}

if(!String.prototype.removeAccents) {
    String.prototype.removeAccents = function ()
    {
        str = this;
        var rExps=[
            {re:/[\xC0-\xC6]/g, ch:'A'},
            {re:/[\xE0-\xE6]/g, ch:'a'},
            {re:/[\xC8-\xCB]/g, ch:'E'},
            {re:/[\xE8-\xEB]/g, ch:'e'},
            {re:/[\xCC-\xCF]/g, ch:'I'},
            {re:/[\xEC-\xEF]/g, ch:'i'},
            {re:/[\xD2-\xD6]/g, ch:'O'},
            {re:/[\xF2-\xF6]/g, ch:'o'},
            {re:/[\xD9-\xDC]/g, ch:'U'},
            {re:/[\xF9-\xFC]/g, ch:'u'},
            {re:/[\xD1]/g, ch:'N'},
            {re:/[\xF1]/g, ch:'n'} ];

        for(var i=0, len=rExps.length; i<len; i++)
            str=str.replace(rExps[i].re, rExps[i].ch);
        str=str.replace("ç","c");
        str=str.replace("&ccedil;","c");
        return str;
    }
}
