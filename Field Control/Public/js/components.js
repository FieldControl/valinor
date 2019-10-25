angular.module('components', [])

.directive('pagination', function()
{
    return {

        restrict: 'E',
        scope: {onNavigate: '<', current: '<', totalPages: '<', pinnedPages: '@', jump: '@'},
        controller: function($scope, $element)
        {
            
            let config = $scope;

            $scope.$watch('current', () => {

                // props
                $scope.pages = [];

                if (config.totalPages > 0)
                {
                    config.current = Number(config.current);
                    config.totalPages = Number(config.totalPages);
                    config.pinnedPages = Number(config.pinnedPages);
                    config.jump = Number($scope.jump);

                    // páginas exibidas à esquerda/direta em relação a atual
                    let max_left_index = $scope.current - $scope.jump; 
                    let max_right_index = $scope.current + $scope.jump;

                    for (let page_number = 1; page_number <= $scope.totalPages; page_number++)
                    {

                        // define as paginas exibidas a esquerda
                        if (max_left_index > config.pinnedPages)
                        {
                            let separator_index = config.pinnedPages + 1;

                            if (page_number == separator_index)
                            {
                                if (max_left_index == separator_index)
                                    config.pages.push(page_number);

                                else
                                    config.pages.push("...");
                            }

                            if (page_number > config.pinnedPages && page_number <= max_left_index)
                                continue;
                        }

                        // define as paginas exibidas a direita
                        if (page_number == max_right_index && max_right_index < config.totalPages - config.pinnedPages)
                        {
                            config.pages.push("...");

                            page_number = config.totalPages - config.pinnedPages;
                            continue;
                        }

                        // se nenhuma das configurações especificas se enquadrarem, mostra o número
                        config.pages.push(page_number);
                    }

                    if (config.current != 1 && config.current > 0)
                        config.pages.unshift("Anterior");

                    if (config.current != config.totalPages && config.totalPages > 0)
                        config.pages.push("Próximo");

                }

            });
        },
        template: `
            <div id="pagination-board">
                <button  
                ng-click="onNavigate(page_number)"
                ng-repeat="page_number in pages track by $index" 
                ng-class="{'current-page': page_number == current}" 
                ng-disabled="{{page_number == '...'}}" 
                ng-bind="page_number">
                </button>
            </div>
            `,
        replace: true
    
    };
})