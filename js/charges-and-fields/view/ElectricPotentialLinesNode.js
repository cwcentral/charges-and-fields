// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node responsible for the drawing of the electricPotential lines and their accompanying voltage labels
 * A debug option can enabled the view of the (model) position points used to calculate the electric potential line.
 * The (pruned) position points that are used to draw the electric potential line can also be displayed.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
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
  var IS_DEBUG = false; // if set to true will show the (model and view) positions use in the calculation of the electric potential lines

  /**
   * Function that generates a voltage label for the electricPotential line
   * @param {number} electricPotential
   * @param {Vector2} position
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function VoltageLabel( electricPotential, position, modelViewTransform ) {

    Node.call( this );

    // a smaller electric potential should have more precision
    var electricPotentialValueString = (Math.abs( electricPotential ) < 1) ? electricPotential.toFixed( 2 ) : electricPotential.toFixed( 1 );

    // Create the voltage label for the electricPotential line
    var voltageLabelString = StringUtils.format( pattern_0value_1units, electricPotentialValueString, voltageUnitString );
    var voltageLabelText = new Text( voltageLabelString,
      {
        font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
        center: modelViewTransform.modelToViewPosition( position )
      } );

    // Create a background rectangle for the voltage label
    var backgroundRectangle = new Rectangle( 0, 0, voltageLabelText.width * 1.4, voltageLabelText.height * 1.4, 3, 3,
      {
        center: modelViewTransform.modelToViewPosition( position )
      } );

    this.addChild( backgroundRectangle ); // must go first
    this.addChild( voltageLabelText );

    // Link the fill color of the background to the default/projector mode
    var rectangleColorFunction = function( color ) {
      backgroundRectangle.fill = color;
    };
    ChargesAndFieldsColors.link( 'background', rectangleColorFunction );

    // Link the fill color of the text for the default/projector mode
    var textColorFunction = function( color ) {
      voltageLabelText.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricPotentialLine', textColorFunction ); // text has the same color as the equipotential line

    // create a dispose function to unlink the color functions
    this.disposeVoltageLabel = function() {
      ChargesAndFieldsColors.unlink( 'electricPotentialLine', textColorFunction );
      ChargesAndFieldsColors.unlink( 'background', rectangleColorFunction );
    };
  }

  inherit( Node, VoltageLabel, {
    dispose: function() {
      this.disposeVoltageLabel();
    }
  } );

  /**
   * Function that generates a scenery path from the shape of the electricPotential line
   * @param {Shape} electricPotentialLineShape
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ElectricPotentialLinePath( electricPotentialLineShape, modelViewTransform ) {

    var self = this;

    Path.call( this, modelViewTransform.modelToViewShape( electricPotentialLineShape ) );

    // Link the stroke color for the default/projector mode
    var pathColorFunction = function( color ) {
      self.stroke = color;
    };
    ChargesAndFieldsColors.link( 'electricPotentialLine', pathColorFunction );

    // create a dispose function to unlink the color functions
    this.disposeElectricPotentialLinePath = function() {
      ChargesAndFieldsColors.unlink( 'electricPotentialLine', pathColorFunction );
    };
  }

  inherit( Path, ElectricPotentialLinePath, {
    dispose: function() {
      this.disposeElectricPotentialLinePath();
    }
  } );

  /**
   * Function that generates an array of Circles with their centers determined by the position array
   * @param {Array.<Vector2>} positionArray
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function Circles( positionArray, modelViewTransform, options ) {

    var self = this;

    Node.call( this );

    options = _.extend( {
      radius: 2
    }, options );

    // create and add all the circles
    positionArray.forEach( function( position ) {
      var circle = new Circle( options.radius, options );
      circle.center = modelViewTransform.modelToViewPosition( position );
      self.addChild( circle );
    } );
  }

  inherit( Node, Circles );

  /**
   * Scenery node that is responsible for displaying the electric potential lines
   *
   * @param {ObservableArray.<ElectricPotentialLine>} electricPotentialLinesArray - array of models of electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isValuesVisibleProperty - control the visibility of the voltage labels
   * @constructor
   */
  function ElectricPotentialLinesNode( electricPotentialLinesArray, modelViewTransform, isValuesVisibleProperty ) {

    // call the super constructor
    Node.call( this );

    // Create and add the parent node for all the lines (paths)
    var pathsNode = new Node();
    this.addChild( pathsNode );

    // Create and add the parent node for the circles (used in DEBUG mode)
    if ( IS_DEBUG ) {
      var circlesNode = new Node();
      this.addChild( circlesNode );
    }

    // Create and add the parent node for the label nodes
    var labelsNode = new Node();
    this.addChild( labelsNode );

    // Monitor the electricPotentialLineArray and create a path and label for each electricPotentialLine
    electricPotentialLinesArray.addItemAddedListener( function( electricPotentialLine ) {

      var electricPotentialLinePath = new ElectricPotentialLinePath( electricPotentialLine.getShape(), modelViewTransform );
      pathsNode.addChild( electricPotentialLinePath );

      var voltageLabel = new VoltageLabel(
        electricPotentialLine.electricPotential,
        electricPotentialLine.position,
        modelViewTransform );
      labelsNode.addChild( voltageLabel );

      if ( IS_DEBUG ) {

        // create all the circles corresponding to the positions calculated in the model
        var electricPotentialModelCircles = new Circles( electricPotentialLine.positionArray, modelViewTransform, { fill: 'pink', radius: 1 } );

        // create all the circles corresponding to the positions used to create the shape of the electric potential line
        var electricPotentialViewCircles = new Circles( electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ), modelViewTransform, { fill: 'orange' } );

        // no translatable strings, for debug only
        var text = new Text( 'model=' + electricPotentialLine.positionArray.length +
                             '    view=' + electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ).length,
          {
            center: modelViewTransform.modelToViewPosition( electricPotentialLine.position ),
            fill: 'green',
            font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT
          } );

        // add the circles and text
        circlesNode.addChild( electricPotentialModelCircles );
        circlesNode.addChild( electricPotentialViewCircles );
        circlesNode.addChild( text );
      }

      electricPotentialLinesArray.addItemRemovedListener( function removalListener( removedElectricPotentialLine ) {
        if ( removedElectricPotentialLine === electricPotentialLine ) {

          pathsNode.removeChild( electricPotentialLinePath );
          labelsNode.removeChild( voltageLabel );
          if ( IS_DEBUG ) {
            circlesNode.removeAllChildren();
          }

          // dispose of the link for garbage collection
          electricPotentialLinePath.dispose();
          voltageLabel.dispose();

          electricPotentialLinesArray.removeItemRemovedListener( removalListener );
        }
      } ); // end of addItemRemovedListener

    } ); // end of addItemAddedListener

    // Control the visibility of the value (voltage) labels
    // no need to unlink present for the lifetime of the sim
    isValuesVisibleProperty.linkAttribute( labelsNode, 'visible' );
  }

  return inherit( Node, ElectricPotentialLinesNode );
} );