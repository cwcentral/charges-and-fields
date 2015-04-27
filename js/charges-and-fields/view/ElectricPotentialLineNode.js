// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node responsible for the drawing of the electricPotential lines and their accompanying voltage labels
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  // constants
  var IS_DEBUG = false;

  /**
   *
   * @param {ObservableArray.<ElectricPotentialLine>} electricPotentialLinesArray - array of models of electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isValuesVisibleProperty - control the visibility of the voltage labels
   * @constructor
   */
  function ElectricPotentialLineNode( electricPotentialLinesArray, modelViewTransform, isValuesVisibleProperty ) {

    Node.call( this );

    // Create and add the parent node for all the line nodes
    var lineNode = new Node();
    this.addChild( lineNode );

    // Create and add the parent node for the label nodes
    var labelNode = new Node();
    this.addChild( labelNode );

    var circleNode = new Node();
    this.addChild( circleNode );

    // Monitor the electricPotentialLineArray and create a path and label for each electricPotentialLine
    electricPotentialLinesArray.addItemAddedListener( function ( electricPotentialLine ) {

      var voltageLabel = labelElectricPotentialLine( electricPotentialLine );
      var rectangle = new Rectangle( 0, 0, voltageLabel.width * 1.5, voltageLabel.height * 1.5,
        {
          center: modelViewTransform.modelToViewPosition( electricPotentialLine.position )
        } );

      // Link the fill color for the default/projector mode
      var rectangleColorFunction = function ( color ) {
        rectangle.fill = color;
      };
      ChargesAndFieldsColors.link( 'background', rectangleColorFunction );

      var electricPotentialLinePath = traceElectricPotentialLine( electricPotentialLine.getShape() );

      lineNode.addChild( electricPotentialLinePath );
      labelNode.addChild( rectangle );
      labelNode.addChild( voltageLabel );

      if ( IS_DEBUG ) {
        var electricPotentialCircle = dotElectricPotentialLine( electricPotentialLine );
        var electricPotentialCircle2 = dot2ElectricPotentialLine( electricPotentialLine );
        //
        circleNode.setChildren( electricPotentialCircle.concat( electricPotentialCircle2 ) );
      }

      electricPotentialLinesArray.addItemRemovedListener( function removalListener( removedElectricPotentialLine ) {
        if ( removedElectricPotentialLine === electricPotentialLine ) {
          lineNode.removeChild( electricPotentialLinePath );
          labelNode.removeChild( rectangle );
          labelNode.removeChild( voltageLabel );
          if ( IS_DEBUG ) {
            circleNode.removeAllChildren();
          }
          ChargesAndFieldsColors.unlink( 'background', rectangleColorFunction );
          ChargesAndFieldsColors.unlink( 'electricPotentialLine', electricPotentialLinePath.colorFunction );
          ChargesAndFieldsColors.unlink( 'electricPotentialLine', voltageLabel.colorFunction );

          electricPotentialLinesArray.removeItemRemovedListener( removalListener );
        }
      } );

    } );

    // Control the visibility of the value (voltage) labels
    // no need to unlink present for the lifetime of the sim
    isValuesVisibleProperty.linkAttribute( labelNode, 'visible' );

    /**
     * Function that generates a path from the electricPotential line shape
     * @param {Shape} electricPotentialLineShape
     * @returns {Path}
     */
    function traceElectricPotentialLine( electricPotentialLineShape ) {


      var electricPotentialLinePath = new Path( modelViewTransform.modelToViewShape( electricPotentialLineShape ) );

      electricPotentialLinePath.colorFunction = function ( color ) {
        electricPotentialLinePath.stroke = color;
      };
      // Link the stroke color for the default/projector mode
      ChargesAndFieldsColors.link( 'electricPotentialLine', electricPotentialLinePath.colorFunction );

      return electricPotentialLinePath;
    }

    /**
     * Function that generates an array of dot of the electricPotential line
     * This includes all the data points calculated in the model
     * @param {ElectricPotentialLine} electricPotentialLine
     * @returns {Array.{Circle}}
     */
    function dotElectricPotentialLine( electricPotentialLine ) {

      var circleArray = [];

      //Simple and naive method to plot lines between all the points
      electricPotentialLine.positionArray.forEach( function ( position ) {
        var circle = new Circle( 2, {fill: 'yellow'} );
        circle.center = modelViewTransform.modelToViewPosition( position );
        circleArray.push( circle );
      } );

      circleArray.colorFunction = function ( color ) {
        circleArray.forEach( function ( circle ) {
          circle.stroke = color;
        } );
      };
      // Link the stroke color for the default/projector mode
      ChargesAndFieldsColors.link( 'electricPotentialLine', circleArray.colorFunction );

      return circleArray;
    }

    /**
     * Function that generates an array of dot of the electricPotential line
     * the dots are from the clean array, i.e. the position array that is used
     * to plot straight lines
     * @param {ElectricPotentialLine} electricPotentialLine
     * @returns {Array.{Circle}}
     */
    function dot2ElectricPotentialLine( electricPotentialLine ) {

      var circleArray = [];
      var positionArray = electricPotentialLine.getCleanUpPositionArray();

      //Simple and naive method to plot lines between all the points
      positionArray.forEach( function ( position ) {
        var circle = new Circle( 2, {fill: 'red'} );
        circle.center = modelViewTransform.modelToViewPosition( position );
        circleArray.push( circle );
      } );

      return circleArray;
    }


    /**
     * Function that generates a voltage label for the electricPotential line
     * @param {ElectricPotentialLine} electricPotentialLine
     * @returns {Text}
     */
    function labelElectricPotentialLine( electricPotentialLine ) {

      //Create the voltage label for the electricPotential line
      var voltageLabelText = StringUtils.format( pattern_0value_1units, electricPotentialLine.electricPotential.toFixed( 1 ), voltageUnitString );
      var voltageLabel = new Text( voltageLabelText,
        {
          font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
          center: modelViewTransform.modelToViewPosition( electricPotentialLine.position )
        } );

      // Link the fill color for the default/projector mode
      voltageLabel.colorFunction = function ( color ) {
        voltageLabel.fill = color;
      };

      ChargesAndFieldsColors.link( 'electricPotentialLine', voltageLabel.colorFunction );

      return voltageLabel;
    }
  }

  return inherit( Node, ElectricPotentialLineNode );
} );