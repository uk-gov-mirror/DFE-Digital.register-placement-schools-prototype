const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class PlacementSchoolRevision extends Model {
    static associate(models) {
      PlacementSchoolRevision.belongsTo(models.PlacementSchool, {
        foreignKey: 'placementSchoolId',
        as: 'placementSchool'
      })

      PlacementSchoolRevision.belongsTo(models.User, {
        foreignKey: 'revisionById',
        as: 'revisionByUser'
      })
    }
  }

  PlacementSchoolRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      placementSchoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'placement_school_id'
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_id'
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id'
      },
      academicYearId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'academic_year_id'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by_id'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      updatedById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'updated_by_id'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      deletedById: {
        type: DataTypes.UUID,
        field: 'deleted_by_id'
      },
      revisionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'revision_number'
      },
      revisionAt: {
        type: DataTypes.DATE,
        field: 'revision_at'
      },
      revisionById: {
        type: DataTypes.UUID,
        field: 'revision_by_id'
      }
    },
    {
      sequelize,
      modelName: 'PlacementSchoolRevision',
      tableName: 'placement_school_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  PlacementSchoolRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'placementSchool',
      revisionTable: 'placement_school_revisions',
      entityIdField: 'placementSchoolId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return PlacementSchoolRevision
}
