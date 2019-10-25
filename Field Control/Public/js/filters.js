angular.module('filters', [])

.filter('shortNumber', function ()
{
    return function (number) 
    {
        // centenas
        if(number <= 999)
            return number;
        
        // milhares
        else if(number >= 1000 && number <= 999999)
            return (number / 1000).toFixed(1) + 'K';
        
        // milhões
        else if(number >= 1000000 && number <= 999999999)
            return (number / 1000000).toFixed(1) + 'M';
        
        // bilhões
        else if(number >= 1000000000 && number <= 999999999999)
            return (number / 1000000000).toFixed(1) + 'B';
        
        else
            return number;
        
    }
})

.filter('descriptionFormat', function ()
{
    return function (description, maxLength) 
    {
        if (!!description)
            return (description.length > maxLength) ? description.substring(0, maxLength) + " ..." : description;
        
        return description;
    }
})

.filter('relativeTime', ['$filter', function ($filter)
{
    return function (date)
    {
        date = new Date(date);

        if (!isNaN(date))
            return moment(date).fromNow();
        
        else
            return date;
        
    }
}]);