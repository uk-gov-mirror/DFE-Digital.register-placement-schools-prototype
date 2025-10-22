const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class SchoolDetailRevision extends Model {
    static associate(models) {
      SchoolDetailRevision.belongsTo(models.SchoolDetail, {
        foreignKey: 'schoolDetailId',
        as: 'schoolDetail'
      })

      SchoolDetailRevision.belongsTo(models.User, {
        foreignKey: 'revisionById',
        as: 'revisionByUser'
      })
    }
  }

  SchoolDetailRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      schoolDetailId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_detail_id'
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_id'
      },
      establishmentNumber: {
        type: DataTypes.STRING,
        field: 'establishment_number'
      },
      regionCode: {
        type: DataTypes.STRING,
        field: 'region_code'
      },
      localAuthorityCode: {
        type: DataTypes.STRING,
        field: 'local_authority_code'
      },
      statutoryLowAge: {
        type: DataTypes.INTEGER,
        field: 'statutory_low_age'
      },
      statutoryHighAge: {
        type: DataTypes.INTEGER,
        field: 'statutory_high_age'
      },
      boarderCode: {
        type: DataTypes.STRING,
        field: 'boarder_code'
      },
      nurseryProvisionCode: {
        type: DataTypes.STRING,
        field: 'nursery_provision_code'
      },
      officialSixthFormCode: {
        type: DataTypes.STRING,
        field: 'official_sixth_form_code'
      },
      genderCode: {
        type: DataTypes.STRING,
        field: 'gender_code'
      },
      religiousCharacterCode: {
        type: DataTypes.STRING,
        field: 'religious_character_code'
      },
      admissionsPolicyCode: {
        type: DataTypes.STRING,
        field: 'admissions_policy_code'
      },
      specialClassCode: {
        type: DataTypes.STRING,
        field: 'special_class_code'
      },
      schoolCapacity: {
        type: DataTypes.INTEGER,
        field: 'school_capacity'
      },
      numberOfBoys: {
        type: DataTypes.INTEGER,
        field: 'number_of_boys'
      },
      numberOfGirls: {
        type: DataTypes.INTEGER,
        field: 'number_of_girls'
      },
      percentageFreeSchoolMeals: {
        type: DataTypes.DECIMAL,
        field: 'percentage_free_school_meals'
      },
      districtAdministrativeCode: {
        type: DataTypes.STRING,
        field: 'district_administrative_code'
      },
      administrativeWardCode: {
        type: DataTypes.STRING,
        field: 'administrative_ward_code'
      },
      parliamentaryConstituencyCode: {
        type: DataTypes.STRING,
        field: 'parliamentary_constituency_code'
      },
      urbanRuralCode: {
        type: DataTypes.STRING,
        field: 'urban_rural_code'
      },
      gssLocalAuthorityCode: {
        type: DataTypes.STRING,
        field: 'gss_local_authority_code'
      },
      msoaCode: {
        type: DataTypes.STRING,
        field: 'msoa_code'
      },
      lsoaCode: {
        type: DataTypes.STRING,
        field: 'lsoa_code'
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
      modelName: 'SchoolDetailRevision',
      tableName: 'school_detail_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  SchoolDetailRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'schoolDetail',
      revisionTable: 'school_detail_revisions',
      entityIdField: 'schoolDetailId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return SchoolDetailRevision
}
