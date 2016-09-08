angular.module('fixtable').directive 'fixtableDraggable', [
  '$document'
  ($document) ->
    restrict: 'A'
    link: (scope, element, attrs) ->
      canDrag = false
      draggableElement = angular.element(element)
      dragElement = null

      scope.cleanup = ->
        el = angular.element(element)
        el.off 'dragstart'
        el.off 'dragend'
        el.off 'drag'

      attrs.$observe 'fixtableDraggable', (newVal) ->
        canDrag = if newVal is 'true' then true else false
        draggableElement.attr "draggable", canDrag

        if canDrag
          draggableElement.on 'dragstart', (e) ->
            offsetX = e.offsetX || e.originalEvent?.offsetX
            offsetY = e.offsetY || e.originalEvent?.offsetY

            dragElement = draggableElement.clone()
            dragElement.addClass 'fixtable-drag-element-live'
            dragElement.css
              position: 'absolute'
              top: '-1000px'

            sourceChildren = draggableElement.children()
            dragChildren = dragElement.children()

            for child, index in sourceChildren
              offsetWidth = sourceChildren[index].offsetWidth
              angular.element(dragChildren[index]).css "width", "#{offsetWidth}px"

            $document.find('body').prepend dragElement

            rowData =
              row: scope.row
              rowIndex: scope.rowIndex

            dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
            dataTransfer.effectAllowed = 'move'

            try
              dataTransfer.setData 'text/plain', JSON.stringify rowData
              dataTransfer.setDragImage(dragElement[0], offsetX, offsetY)
            catch e
              dragElement.css
                position: 'fixed'
                'z-index': 1000
                cursor: 'none'
                opacity: '0.5'
              scope.dragOffset =
                offsetX:offsetX
                offsetY:offsetY
                rect: dragElement[0].getBoundingClientRect()
              dataTransfer.setData 'Text', JSON.stringify rowData

            draggableElement.addClass 'fixtable-drag-element'
            scope.$emit 'fixtable-drag-start', scope
            return true

          draggableElement.on 'dragend', ->
            scope.$emit 'fixtable-drag-end'
            draggableElement.removeClass 'fixtable-drag-element'
            dragElement.remove()
            scope.dragOffset = null

            return true

          draggableElement.on 'drag', (e) ->
            if scope.dragOffset and dragElement
              x = (e.pageX || e.originalEvent?.pageX) - scope.dragOffset.offsetX;
              y = (e.pageY || e.originalEvent?.pageY) - scope.dragOffset.rect.height

              dragElement.css
                left: x
                top: y
        else
          scope.cleanup()

      scope.$on '$destroy', ->
        scope.cleanup()
  ]

angular.module('fixtable').directive 'fixtableDroppable', [
  ->
    restrict: 'A'
    link: (scope, element, attrs) ->
      canDrop = false

      scope.cleanup = ->
        el = angular.element(element)
        el.off 'dragenter'
        el.off 'dragover'
        el.off 'dragleave'
        el.off 'drop'

      attrs.$observe 'fixtableDroppable', (newVal) ->
        canDrop = if newVal is 'true' then true else false

        if canDrop
          angular.element(element).on 'dragenter', (e) ->
            if e.preventDefault
              e.preventDefault()

            dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
            dataTransfer.dropEffect = 'move'
            return false

          angular.element(element).on 'dragover', (e) ->
            if e.preventDefault
              e.preventDefault()

            dropIndex = scope.rowIndex
            draggedIndex = scope.currentDragScope?.rowIndex

            unless draggedIndex is dropIndex
              if draggedIndex > dropIndex
                angular.element(element).addClass 'fixtable-drop-above'
              else
                angular.element(element).addClass 'fixtable-drop-below'

            angular.element(element).addClass 'fixtable-drag-over'
            return false

          angular.element(element).on 'dragleave', ->
            angular.element(element).removeClass 'fixtable-drag-over'
            angular.element(element).removeClass 'fixtable-drop-above'
            angular.element(element).removeClass 'fixtable-drop-below'

          angular.element(element).on 'drop', (e) ->
            if e.preventDefault
              e.preventDefault()
            if e.stopPropagation
              e.stopPropagation()

            scope.$emit 'fixtable-drag-drop'
        else
          scope.cleanup()

      scope.$on 'fixtable-drag-started', (e,draggedScope)->
        unless scope.$parent.currentDragScope.$id is scope.$id
          angular.element(element).addClass 'fixtable-drop-target'

        scope.currentDragScope = draggedScope;

      scope.$on 'fixtable-drag-ended', ->
        scope.currentDragScope = null
        el = angular.element(element)
        el.removeClass 'fixtable-drop-target'
        el.removeClass 'fixtable-drag-over'
        el.removeClass 'fixtable-drop-above'
        el.removeClass 'fixtable-drop-below'
        el.triggerHandler 'mouseleave'

      scope.$on '$destroy', ->
        scope.cleanup()
  ]
